import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      <div className="text-center space-y-6">
        <h1 className="text-7xl font-bold text-gray-800 dark:text-white animate-pulse">
          404
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Oops! The page you’re looking for doesn’t exist.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-black px-6 py-3 text-white text-sm font-medium transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-300"
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}
