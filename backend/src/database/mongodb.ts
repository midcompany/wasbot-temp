import mongoose from "mongoose";

mongoose.set("strictQuery", true);
mongoose.connect('mongodb://root:example@localhost:27018');
