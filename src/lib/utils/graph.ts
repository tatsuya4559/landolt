export class Node<T> {
    id: string;
    data: T;
    adjacents: Node<T>[];

    constructor(id: string, data: T) {
        this.id = id
        this.data = data
        this.adjacents = []
    }

    addAdjacent(node: Node<T>) {
        this.adjacents.push(node)
    }

    removeAdjacent(node: Node<T>) {
        this.adjacents = this.adjacents.filter(adj => adj !== node)
    }
}

export class Graph<T> {
    nodes: Map<string, Node<T>>

    constructor() {
        this.nodes = new Map()
    }

    addNode(id: string, data: T) {
        this.nodes.set(id, new Node(id, data))
    }

    removeNode(id: string) {
        const nodeToRemove = this.nodes.get(id)
        if (nodeToRemove == null) {
            return
        }
        nodeToRemove.adjacents.forEach(adj => {
            this.removeNode(adj.id)
        })
        this.nodes.forEach(node => {
            node.removeAdjacent(nodeToRemove)
        })
        this.nodes.delete(id)
    }

    getNode(id: string) {
        return this.nodes.get(id)
    }

    addEdge(from: string, to: string) {
        const fromNode = this.nodes.get(from)
        const toNode  = this.nodes.get(to)
        if (fromNode == null || toNode == null) {
            console.warn(`addEdge: node is null`)
            return
        }
        fromNode.addAdjacent(toNode)
    }
}