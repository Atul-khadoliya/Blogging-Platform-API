require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');

// middleware
app.use(express.json());
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("Error connecting to MongoDB:", error));

const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    category: String,
    tags: Array,
    createdAt: Date,
    updatedAt: Date
});

const Blog = mongoose.model('Blogs', blogSchema);

// making the blog
app.post('/posts', async (req, res) => {
    const { title, content, category, tags } = req.body;
    const createdAt = new Date();
    const updatedAt = new Date();
    const blog = new Blog({
        title,
        content,
        category,
        tags,
        createdAt,
        updatedAt,
    });
    try {
        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        res.status(400).json({ msg: "error while saving the new post", error });
    }
});

app.put('/posts/:_id', async (req, res) => {
    const _id = req.params._id;
    const updateField = { ...req.body, updatedAt: new Date() };
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(_id, updateField, { new: true, runValidators: true });
        if (!updatedBlog)
            return res.status(404).json({ msg: "not found" });
        res.status(200).json(updatedBlog);
    } catch (error) {
        res.status(400).json({ msg: "Bad request" });
    }
});

app.delete('/posts/:_id', async (req, res) => {
    const _id = req.params._id;
    try {
        const deletedBlog = await Blog.findByIdAndDelete(_id);
        if (!deletedBlog)
            return res.status(404).json({ msg: "blog not found" });

        res.status(200).json({ msg: "succesful" });
    } catch (error) {
        res.status(400).json({ error });
    }
});

app.get('/posts/:_id', async (req, res) => {
    const _id = req.params._id;
    try {
        const blog1 = await Blog.findById(_id);
        if (!blog1)
            return res.status(404).json({ msg: "not found" });
        res.status(200).json(blog1);
    } catch (error) {
        res.status(400).json({ error });
    }
});

app.get('/posts', async (req, res) => {
    const { term } = req.query;
    try {
        const filter = term ? {
            $or: [
                { title: { $regex: term, $options: 'i' } },
                { content: { $regex: term, $options: 'i' } },
                { category: { $regex: term, $options: 'i' } }
            ]
        } : {};
        const blog = await Blog.find(filter);
        res.status(200).json(blog);
    } catch (error) {
        res.status(404).json({ msg: "could not find" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`app is listening to ${PORT}`);
});

