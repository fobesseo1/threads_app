"use client";

import * as z from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommentValidation } from "@/lib/validations/thread";
import { addCommentToThread } from "@/lib/actions/thread.actions";
import { updateUser } from "@/lib/actions/user.actions";

//import { createThread } from "@/lib/actions/thread.actions";

interface Props {
    threadId : string ;
    currentUserId : string ;
    currentUserImg : string ;
}

const Comment = ({threadId, currentUserId, currentUserImg} : Props) => {

    const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      thread: "",
    },
  });

  //console.log(userId);

  const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
    await addCommentToThread(
        threadId,
        values.thread,
        JSON.parse(currentUserId),
        pathname
      );

      form.reset();
  };  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex w-full items-center gap-3">
              <FormLabel>
              <Image
                  src={currentUserImg}
                  alt='current_user'
                  width={48}
                  height={48}
                  className='rounded-full object-cover'
                />
              </FormLabel>
              <FormControl className="border-none bg-transparent">
                <Input type="text"
                placeholder="Comment..."
                className="no-focus text-light-1 outline-none "
                {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="comment-form_btn">
         Reply
        </Button>
      </form>
    </Form>
  )
}

export default Comment