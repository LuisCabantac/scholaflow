import { X } from "lucide-react";
import { motion } from "motion/react";
import { Dispatch, SetStateAction, useRef } from "react";

import { useClickOutside } from "@/contexts/ClickOutsideContext";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function JoinClassDialog({
  isLoading,
  onJoinClass,
  onShowJoinClass,
  setShowJoinClass,
}: {
  isLoading: boolean;
  onShowJoinClass: () => void;
  onJoinClass: (event: React.FormEvent) => Promise<void>;
  setShowJoinClass: Dispatch<SetStateAction<boolean>>;
}) {
  const { useClickOutsideHandler } = useClickOutside();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useClickOutsideHandler(
    wrapperRef,
    () => {
      setShowJoinClass(false);
    },
    isLoading,
  );

  return (
    <motion.div
      className="modal__container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="md:w-[25rem]" ref={wrapperRef}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                Add user to class
              </h3>
              <Button
                className="hover:bg-transparent disabled:cursor-not-allowed"
                variant="ghost"
                type="button"
                size="icon"
                disabled={isLoading}
                onClick={onShowJoinClass}
              >
                <X className="size-5 stroke-foreground" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={onJoinClass} className="grid gap-4">
              <Input
                disabled={isLoading}
                required
                type="text"
                name="classCode"
                maxLength={8}
                placeholder="Enter the class code here"
              />
              <div className="flex items-center justify-end gap-2">
                {!isLoading && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onShowJoinClass}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  Join
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
