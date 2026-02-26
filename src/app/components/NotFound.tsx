import { Link } from "react-router";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="text-center">
        <div className="text-[6rem] leading-none text-primary/20" style={{ fontWeight: 800 }}>404</div>
        <h1 className="mt-4 text-[1.5rem]" style={{ fontWeight: 600 }}>页面未找到</h1>
        <p className="mt-2 text-muted-foreground">你要找的页面不存在或已被移动。</p>
        <Link to="/">
          <Button className="mt-6 rounded-full bg-primary text-white hover:bg-primary/90">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Button>
        </Link>
      </div>
    </div>
  );
}
