import { worldBlocked, worldLineOfSight, type Floor, type Vec } from './floor';
const tile = 30;
type Graph = {
    cols: number;
    points: Vec[];
    walkable: number[];
    edges: number[][];
    queue: Int32Array;
    parents: Int32Array;
    visited: Int32Array;
    stamp: number;
};
const graphs = new WeakMap<Floor, Graph>();
export function navigationGraph(floor: Floor): Graph {
    const cached = graphs.get(floor);
    if (cached)
        return cached;
    const cols = Math.ceil(floor.width / tile), rows = Math.ceil(floor.height / tile), count = cols * rows;
    const points = Array.from({ length: count }, (_, i) => ({ x: i % cols * tile + 15, y: Math.floor(i / cols) * tile + 15 }));
    const walkable: number[] = [], clear = new Uint8Array(count), edges: number[][] = Array.from({ length: count }, () => []);
    for (let i = 0; i < count; i++)
        if (!worldBlocked(floor, points[i].x, points[i].y, 13)) {
            clear[i] = 1;
            walkable.push(i);
        }
    for (const i of walkable)
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const x = i % cols + dx, y = Math.floor(i / cols) + dy, n = y * cols + x;
            if (x >= 0 && y >= 0 && x < cols && y < rows && clear[n] && worldLineOfSight(floor, points[i], points[n], 13))
                edges[i].push(n);
        }
    const graph = { cols, points, walkable, edges, queue: new Int32Array(count), parents: new Int32Array(count), visited: new Int32Array(count), stamp: 0 };
    graphs.set(floor, graph);
    return graph;
}
export function cellOf(floor: Floor, p: Vec) { return Math.floor(p.y / tile) * Math.ceil(floor.width / tile) + Math.floor(p.x / tile); }
export function nearestCell(floor: Floor, p: Vec): number {
    const graph = navigationGraph(floor), direct = cellOf(floor, p), point = graph.points[direct];
    if (point && !worldBlocked(floor, point.x, point.y, 13))
        return direct;
    let best = -1, minimum = Infinity;
    for (const i of graph.walkable) {
        const q = graph.points[i], d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
        if (d < minimum && worldLineOfSight(floor, p, q)) {
            best = i;
            minimum = d;
        }
    }
    return best;
}
export function searchPath(floor: Floor, from: Vec, to: Vec): Vec[] {
    const graph = navigationGraph(floor), start = nearestCell(floor, from), goal = nearestCell(floor, to);
    if (start < 0 || goal < 0)
        return [];
    if (start === goal)
        return worldLineOfSight(floor, from, to, 13) ? [{ x: to.x, y: to.y }] : [];
    if (++graph.stamp === 2147483647) {
        graph.visited.fill(0);
        graph.stamp = 1;
    }
    const stamp = graph.stamp;
    let head = 0, tail = 1;
    graph.queue[0] = start;
    graph.visited[start] = stamp;
    while (head < tail) {
        const current = graph.queue[head++];
        if (current === goal)
            break;
        for (const next of graph.edges[current])
            if (graph.visited[next] !== stamp) {
                graph.visited[next] = stamp;
                graph.parents[next] = current;
                graph.queue[tail++] = next;
            }
    }
    if (graph.visited[goal] !== stamp)
        return [];
    const result: Vec[] = [];
    for (let at = goal; at !== start; at = graph.parents[at])
        result.push(graph.points[at]);
    result.reverse();
    if (Math.hypot(from.x - graph.points[start].x, from.y - graph.points[start].y) > 8 && worldLineOfSight(floor, from, graph.points[start], 13))
        result.unshift(graph.points[start]);
    return result;
}
export function reachableCells(floor: Floor, from: Vec): Set<number> { const graph = navigationGraph(floor), start = nearestCell(floor, from), seen = new Set<number>([start]), queue = [start]; for (let i = 0; i < queue.length; i++)
    for (const n of graph.edges[queue[i]] || [])
        if (!seen.has(n)) {
            seen.add(n);
            queue.push(n);
        } return seen; }
