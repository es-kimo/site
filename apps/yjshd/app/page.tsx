import { TheHeader } from "@/components/TheHeader";
import { SubCategoryParams } from "@workspace/common/structure/params.types";
import { Button } from "@workspace/ui/components/button";
import { Link2 } from "lucide-react";
import { Link } from "next-view-transitions";
import Image from "next/image";

export default function Page({ params }: { params: Promise<SubCategoryParams> }) {
  return (
    <>
      <Background />
      <div>
        <TheHeader params={params} />

        <main className="p-6 mt-3 sm:mt-12 lg:mt-24 flex flex-col gap-8 lg:gap-16 w-fit mx-auto">
          <div>
            <div className="text-2xl sm:text-4xl">
              <p className="font-bold">더 나은 의료 서비스를 향한 도약</p>
              <h2>연세정성내과의 발돋움 2025</h2>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:justify-between gap-8 lg:gap-36">
            <div>
              <p className="mb-3 sm:text-xl sm:leading-10 text-muted-foreground opacity-0 animate-fade-in-up">
                정상이 어디인지 누구도 알 수 없습니다.
                <br />
                어제보다 나은 내일을 위해
                <br />
                오늘 혁신하고
                <br />
                오시는 한 분 한 분 정성을 다합니다.
              </p>

              <Button variant="secondary" className="opacity-0 animate-fade-in-up delay-300 w-full lg:w-[initial] sm:text-lg" asChild>
                <Link href="/1.연세정성내과의 발돋움/1.2025 발돋움">
                  2025 발돋움 <Link2 />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 overflow-auto">
              <Image src={"/doctor.png"} alt="의사선생님" width={230} height={250} />
              <Image src={"/mission.png"} alt="연세정성내과 미션과 비젼" width={230} height={250} className="h-[stretch]" />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

const Background = () => <div className="-z-50 fixed top-0 left-0 w-full h-dvh bg-[linear-gradient(180deg,_#FCFCFC_80%,_#D8E7F2_100%)]" />;
