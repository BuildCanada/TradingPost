import Link from "next/link";
import { BASE_PATH } from "@/app/bills/utils/basePath";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-[800px] px-6 py-10">
      <h1 className="type-h3 text-dark">Sorry! </h1>
      <p className="mt-2 text-sm text-text-secondary">
        You don’t have access to view this page.
      </p>
      <div className="mt-4 space-x-4">
        <Link
          className="text-sm text-accent hover:underline"
          href={BASE_PATH || "/"}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
