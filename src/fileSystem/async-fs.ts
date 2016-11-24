import * as fs from "fs";

// async-file read and writes don't work. Need to implement my own async functions
export let read = async (fd: number, buffer: Buffer, position: number): Promise<{ bytesRead: number}> => {
    return new Promise((resolve: (obj: { bytesRead: number }) => void, reject) => {
        fs.read(fd, buffer, 0, buffer.length, position, (err, bytesRead) => {
            if (!err) { 
                resolve({ bytesRead: bytesRead }); 
            } else { 
                reject(err); 
            }
        });
    });
};

export let write = async (fd: number, data: any, offset: number, size: number, position: number): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        fs.write(fd, data, offset, size, position, err => {
            if (!err) { resolve(); } else { reject(); }
        });
    });
};