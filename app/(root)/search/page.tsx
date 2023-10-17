import Image from "next/image";

import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";

import { profileTabs } from "@/constants";

import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ThreadsTab from "@/components/shared/ThreadsTab";
import UserCard from "@/components/cards/UserCard";

async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  //fetch users
  const result = await fetchUsers({
    userId : user.id,
    searchString : '',
    pageNumber : 1,
    pageSize : 25,
  }
  )

    return(
    <section>
        <h1 className="head-text mb-10">search</h1>

        {/* search bar */}

        <div className='mt-14 flex flex-col gap-9'>
            {result.users.length === 0 ? (
                <p className="no-result">No result</p>
            ):(
                <>
                {result.users.map((person)=>{
                    return(
                    <UserCard
                    key={person.id}
                    id={person.id}
                    name={person.name}
                    username={person.username}
                    imgUrl={person.image}
                    personType='User'    />
                    )
                })}
                </>
            )}
        </div>
    </section>
    )
}

export default Page