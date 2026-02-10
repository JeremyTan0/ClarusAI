import Link from "next/dist/client/link";

export default function LoginRoute() {
  return <div className="">
    <main className="bg-white p-4 rounded-md">
      <h1 className="text-2xl font-bold text-black">Login Route</h1>
      <form className="space-y-4 p-4 rounded-md">
        <label htmlFor="name" className="block m-2 text-black">Username: </label>
        <input type="text" id="name" name="name" className="text-black border border-gray-300 rounded-md p-2" required />

        <label htmlFor="password" className="block m-2 text-black">Password: </label>
        <input type="password" id="password" name="password" className="text-black border border-gray-300 rounded-md p-2" required />

        <button type="submit" className="block  text-black border border-gray-300 rounded-md p-2">Submit</button>
      </form>
      <Link href="/signup" className="text-blue-500 underline mt-4 block">
        Don't have an account? SignUp
      </Link>
    </main>
  </div>;
}