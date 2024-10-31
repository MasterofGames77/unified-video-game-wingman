import mongoose, { Document, Model, Schema } from 'mongoose';

interface IQuestion extends Document {
  userId: string;
  question: string;
  response: string;
  timestamp: Date;
}

const QuestionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    question: { type: String, required: true },
    response: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
}, { collection: 'questions' });  // Explicitly sets the collection name

const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

export default Question;
export type { IQuestion };