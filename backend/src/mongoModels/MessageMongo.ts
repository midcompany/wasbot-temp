import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  ack: number;
  body: string;
  companyId: number;
  createdAt: Date;
  dataJson: string;
  fromMe: boolean;
  id: string;
  isDeleted: boolean;
  isEdited: boolean;
  mediaType: string;
  read: boolean;
  remoteJid: string;
  ticketId: number;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    ack: { type: Number, required: false },
    body: { type: String, required: false },
    companyId: { type: Number, required: false },
    createdAt: { type: Date, default: Date.now },
    dataJson: { type: String, required: false },
    fromMe: { type: Boolean, required: false },
    id: { type: String, required: false, unique: true },
    isDeleted: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    mediaType: { type: String, required: false },
    read: { type: Boolean, default: false },
    remoteJid: { type: String, required: false },
    ticketId: { type: Number, required: false },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const MessageMongo = mongoose.model<IMessage>("Messages", MessageSchema);
