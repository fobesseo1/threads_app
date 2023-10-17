import Link from "next/link";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { fetchUser, getActivity } from "@/lib/actions/user.actions";

async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const activity = await getActivity(userInfo._id);

  console.log(activity);

    return (
      <>
          <h1 className="head-text mb-10">activity</h1>

          <section className='mt-10 flex flex-col gap-5'>
            {activity.length > 0 ? (
              <>
              {activity.map((activity)=>{
return (                <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                  <article className="activity-card">
                  <Image
                    src={activity.author.image}
                    alt='user_logo'
                    width={20}
                    height={20}
                    className='rounded-full object-cover'
                  />
                   <p className='!text-small-regular  text-light-1'>
                     <span className='mr-1 text-primary-500'>
                       {activity.author.name}
                     </span>{" "}
                     replied to your thread
                     <span className="text-white ml-7">comment : {activity.text}</span>
                   </p>                    
                  </article>
                </Link>)
              })

              }
              </>
            ):(<p className='!text-base-regular text-light-3'>No activity yet</p>)}
          </section>
      </>
    )
  }
  
  export default Page