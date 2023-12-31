import fs from "fs";

export class Queue {
    
    constructor(private srcPath: string, private outputPath: string) { }

    /**
     *  Update queue array of untreated files
     * @returns unprocessed files array
     */
    async filesToProcess() {
        const rawFilesList: string[] = await fs.readdirSync(`${this.srcPath}`, "utf-8");
        const treatedFilesList: string[] = await fs.readdirSync(`${this.outputPath}`, "utf-8");

        const filesOnQueue = rawFilesList.filter(
            (fileName) => !treatedFilesList.includes("FINISH - " + fileName) && fileName.includes('.csv')
            );
            
        if(filesOnQueue.length) {
            console.log(filesOnQueue.length, " files on queue");
            console.table(filesOnQueue);
        } else
            console.error("None file on queue")

        return filesOnQueue;
    }
}