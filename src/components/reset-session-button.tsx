"use client";

import { useRouter } from "next/navigation";

import { clearTestSession } from "@/lib/quiz/storage";

type ResetSessionButtonProps = {
  label: string;
  className?: string;
};

export function ResetSessionButton({
  label,
  className = "btn btn--secondary",
}: ResetSessionButtonProps) {
  const router = useRouter();

  function handleClick() {
    clearTestSession();
    router.push("/");
  }

  return (
    <button type="button" className={className} onClick={handleClick}>
      {label}
    </button>
  );
}
