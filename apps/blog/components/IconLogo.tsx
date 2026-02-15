import { Button } from "@workspace/ui/components/button";
import { Link } from "next-view-transitions";
import Image from "next/image";
import KHLogo from "../assets/icon.png";

export const IconLogo = () => {
  return (
    <Button variant="ghost" size="icon" aria-label="Go Home" asChild>
      <Link href="/">
        <Image src={KHLogo} alt="KHLogo" width={24} height={24} />
      </Link>
    </Button>
  );
};
