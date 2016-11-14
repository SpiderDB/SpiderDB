/**
 * SpiderNode
 */
class SpiderNode implements INodeManagement{
    constructor() {
        
    }

    //INodeManagement
    getNode(id: number) : SpiderNode {
        var node = new SpiderNode();
        return node;
    }

    createNode() : SpiderNode {
        var node = new SpiderNode();
        return node;
    }

    updateNode(node: SpiderNode) {
        return node;
    }

    removeNode() {

    }
}