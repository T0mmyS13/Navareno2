"use client";

import Link from "next/link";
import Image from "next/image";

type CategoryProps = {
    title: string;
    link: string;
    description: string;
    image: string;
};

const Category = ({ title, link, description, image }: CategoryProps) => {
    return (
        <Link
            href={link}
            className="block bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
        >
            <div className="relative w-full h-48">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                />
            </div>
            <div className="p-4">
                <h3 className="text-xl font-semibold mb-1">{title}</h3>
                <p className="text-gray-600 text-sm">{description}</p>
            </div>
        </Link>
    );
};

export default Category;
