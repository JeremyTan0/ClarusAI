import Link from "next/dist/client/link";

export default function SignUpRoute() {
  return <div className="flex items-center justify-center font-sans">
    <main className="bg-white p-4 rounded-md">
      <h1 className="text-2xl font-bold text-black">Sign Up Route</h1>
      <form className="space-y-4 p-4 rounded-md">
        <label htmlFor="name" className="block m-2 text-black">Username: </label>
        <input type="text" id="name" name="name" className="text-black border border-gray-300 rounded-md p-2" required />

        <label htmlFor="password" className="block m-2 text-black">Password: </label>
        <input type="password" id="password" name="password" className="text-black border border-gray-300 rounded-md p-2" required />

        <label htmlFor="email" className="block m-2 text-black">Email: </label>
        <input type="email" id="email" name="email" className="text-black border border-gray-300 rounded-md p-2" required />

        <button type="submit" className="block text-black border border-gray-300 rounded-md p-2">Submit</button>
      </form>
      <Link href="/login" className="text-blue-500 underline m-4 block">
        Already have an account? Login
      </Link>
    </main>
  </div>;
}