"use server";

import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({ text, author, communityId, path }: Params) {
  try {
    connectToDB();

    const createdThread = await Thread.create({
      text,
      author,
      community: null, // Assign communityId if provided, or leave it null for personal account
    });

    //update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();
  //calculate the number of skip
  const skipAmount = (pageNumber - 1) * pageSize;

  // fetch post that have no parent (top-level thread)
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  // Count the total number of top-level posts (threads) i.e., threads that are not comments.
  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  const posts = await postsQuery.exec();
  
  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

export async function fetchThreadById(id : string){
  connectToDB();

  try{
    const thread = await Thread.findById(id)
    .populate({
      path: "author",
      model: User,
      select: "_id id name image",
    }) // Populate the author field with _id and username
    .populate({
      path: "children", // Populate the children field
      populate: [
        {
          path: "author", // Populate the author field within children
          model: User,
          select: "_id id name parentId image", // Select only _id and username fields of the author
        },
        {
          path: "children", // Populate the children field within children
          model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
          populate: {
            path: "author", // Populate the author field within nested children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
        },
      ],
    })
    .exec();

  return thread;
  } catch(err){
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }

}
export async function addCommentToThread(
  threadId : string,
  commentText : string,
  userId : string,
  path: string,
){
  connectToDB();

  try{
    //1.원래 트레드를 id로 찾는다
    const originalThread = await Thread.findById(threadId);

    if(!originalThread) {
      throw new Error("thread not found")
    };
    //2.원래 트레드에 코맨트를 추가한다.
    const commentThread = new Thread({
      text : commentText,
      author : userId,
      parentId : threadId,
    });
    //3.트레드를 저장한다.
    const savedCommentThread = await commentThread.save();
    //4.원래 트레드에 새로운 코멘트를 달어서 업데이트한다.
    originalThread.children.push(savedCommentThread._id);
    //5.원래 트레드 저장
    await originalThread.save();

  } catch(err : any){
    throw new Error(`Error adding comment to thread : ${err.message}`)
  }
}
