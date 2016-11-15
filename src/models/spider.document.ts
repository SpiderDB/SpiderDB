/**
 * SpiderDocument
 */
class SpiderDocument implements IDocumentManagement {
    constructor() {
        
    }

    //IDocumentManagement
    getDocument(id: number) : SpiderDocument {
        var document = new SpiderDocument();
        return document;
    }

    createDocument() : SpiderDocument {
        var document = new SpiderDocument();
        return document;
    }

    updateDocument(document: SpiderDocument) {
        return document;
    }

    removeDocument() {

    }
}