import Link from "next/link";
import React from 'react';


const Navbar = () => {
    return (
        <nav className='fixed yop-0 w-full flex items-center 
        justify-around py-5 px-24 border-b border-grey-700 bg-black'>

            <Link href= '/' className= 'btn btn-primary transition duration-300 hover:scale-110'>
            Home
            </Link>

            <ul className="flex gap-10 text-lg">
                <Link href='/about' 
                className=" text-gray-300 hover:text-white transition-colors"
                >
                    About
                </Link>

                <Link href='/stocks' 
                className=" text-gray-300 hover:text-white transition-colors"
                >
                    Stocks
                </Link>

                <Link href='/contact' 
                className=" text-gray-300 hover:text-white transition-colors"
                >
                    Contact
                </Link>

                <Link href='/other' 
                className=" text-gray-300 hover:text-white transition-colors"
                >
                    Other
                </Link>
            </ul>

        </nav>
    )
}

export default Navbar