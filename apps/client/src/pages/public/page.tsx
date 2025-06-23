import { t } from "@lingui/macro";
import { CircleNotch, FilePdf } from "@phosphor-icons/react";
import type { ResumeDto } from "@reactive-resume/dto";
import { Button } from "@reactive-resume/ui";
import { pageSizeMap } from "@reactive-resume/utils";
import { useCallback, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import type { LoaderFunction } from "react-router";
import { Link, redirect, useLoaderData } from "react-router";

import { Icon } from "@/client/components/icon";
import { ThemeSwitch } from "@/client/components/theme-switch";
import { queryClient } from "@/client/libs/query-client";
import { findResumeByUsernameSlug, usePrintResume } from "@/client/services/resume";

const openInNewTab = (url: string) => {
  const win = window.open(url, "_blank");
  if (win) win.focus();
};

export const PublicResumePage = () => {
  const frameRef = useRef<HTMLIFrameElement>(null);

  const { printResume, loading } = usePrintResume();

  const { id, title, data: resume } = useLoaderData();
  const format = resume.metadata.page.format as keyof typeof pageSizeMap;

  const updateResumeInFrame = useCallback(() => {
    const message = { type: "SET_RESUME", payload: resume };

    setTimeout(() => {
      frameRef.current?.contentWindow?.postMessage(message, "*");
    }, 100);
  }, [frameRef.current, resume]);

  useEffect(() => {
    if (!frameRef.current) return;
    frameRef.current.addEventListener("load", updateResumeInFrame);
    return () => frameRef.current?.removeEventListener("load", updateResumeInFrame);
  }, [frameRef]);

  useEffect(() => {
    if (!frameRef.current?.contentWindow) return;

    const handleMessage = (event: MessageEvent) => {
      if (!frameRef.current?.contentWindow) return;
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "PAGE_LOADED") {
        frameRef.current.width = event.data.payload.width;
        frameRef.current.height = event.data.payload.height;
        frameRef.current.contentWindow.removeEventListener("message", handleMessage);
      }
    };

    frameRef.current.contentWindow.addEventListener("message", handleMessage);

    return () => {
      frameRef.current?.contentWindow?.removeEventListener("message", handleMessage);
    };
  }, [frameRef]);

  return (
    <div>
      <Helmet>
        <title>
          {title}
        </title>
      </Helmet>

      <div
        style={{ width: `${pageSizeMap[format].width}mm` }}
        className="relative z-50 overflow-hidden rounded shadow-xl sm:mx-auto sm:mb-6 sm:mt-16 print:m-0 print:shadow-none"
      >
        <iframe
          ref={frameRef}
          title={title}
          src="/artboard/preview"
          style={{ width: `${pageSizeMap[format].width}mm`, overflow: "hidden" }}
        />
      </div>

      <div className="fixed bottom-5 right-5 z-0 hidden sm:block print:hidden">
        <div className="flex flex-col items-center gap-y-2">
          <ThemeSwitch />
        </div>
      </div>
    </div>
  );
};

export const publicLoader: LoaderFunction<ResumeDto> = async ({ params }) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const username = params.username!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const slug = params.slug!;
    const t = params.t!;

    return await queryClient.fetchQuery({
      queryKey: ["resume", { username, slug, t }],
      queryFn: () => findResumeByUsernameSlug({ username, slug, t }),
    });
  } catch {
    return redirect("/");
  }
};
