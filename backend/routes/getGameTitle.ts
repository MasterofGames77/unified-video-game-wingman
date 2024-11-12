import { Request, Response } from 'express';
import path from 'path';
import { readFile } from 'fs/promises';
import { parse } from 'csv-parse/sync';

const getGameTitles = async (req: Request, res: Response) => {
    try {
        // Adjust the path to the CSV file based on the location in new-video-game-wingman
        const csvFilePath = path.join(__dirname, '../data/Video Games Data.csv');
        const fileContent = await readFile(csvFilePath, 'utf8');
        const records = parse(fileContent, { columns: true });
        
        // Extract game titles
        const titles = records.map((record: any) => record.title);
        res.status(200).json(titles);
    } catch (error) {
        console.error('Error reading the CSV file:', error);
        res.status(500).json({ message: 'Failed to read CSV data' });
    }
};

export default getGameTitles;