import { Link } from "react-router";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

export function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
          className="text-[6rem] leading-none text-primary/20"
          style={{ fontWeight: 800 }}
        >
          404
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-4 text-[1.5rem]"
          style={{ fontWeight: 600 }}
        >
          页面未找到
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-2 text-muted-foreground"
        >
          你要找的页面不存在或已被移动。
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Link to="/">
            <Button className="mt-6 rounded-full bg-primary text-white hover:bg-primary/90">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回首页
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
