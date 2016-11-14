/**
 * NodeAPI
 */

declare interface INodeManagement {
    /**Returns a node based  */
    getNode(id: number) : SpiderNode;
    createNode() : SpiderNode;
    updateNode(node: SpiderNode) : SpiderNode;
    removeNode();
}