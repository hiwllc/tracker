import type { PropsWithChildren, ReactNode } from "react";
import { useMediaQuery } from "~/hooks/use-media-query";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import type { DialogContentProps, DialogProps } from "@radix-ui/react-dialog";

export function Modal({
  dismissible = true,
  ...props
}: DialogProps & { dismissible?: boolean }) {
  const isDesktop = useMediaQuery("(min-width: 764px)");

  if (isDesktop) {
    return <Dialog {...props} />;
  }

  return <Drawer {...props} dismissible={dismissible} />;
}

export function ModalTrigger({ children }: PropsWithChildren) {
  const isDesktop = useMediaQuery("(min-width: 764px)");

  if (isDesktop) {
    return <DialogTrigger asChild>{children}</DialogTrigger>;
  }

  return <DrawerTrigger asChild>{children}</DrawerTrigger>;
}

export function ModalContent(
  props: DialogContentProps & {
    closable?: boolean;
  },
) {
  const isDesktop = useMediaQuery("(min-width: 764px)");

  if (isDesktop) {
    return <DialogContent {...props} />;
  }

  return <DrawerContent {...props} />;
}

export function ModalHeader({ children }: PropsWithChildren) {
  const isDesktop = useMediaQuery("(min-width: 764px)");

  if (isDesktop) {
    return <DialogHeader>{children}</DialogHeader>;
  }

  return <DrawerHeader>{children}</DrawerHeader>;
}

export function ModalTitle({ children }: PropsWithChildren) {
  const isDesktop = useMediaQuery("(min-width: 764px)");

  if (isDesktop) {
    return <DialogTitle>{children}</DialogTitle>;
  }

  return <DrawerTitle>{children}</DrawerTitle>;
}

export function ModalDescription({
  children,
  asChild,
}: PropsWithChildren<{ asChild?: boolean }>) {
  const isDesktop = useMediaQuery("(min-width: 764px)");

  if (isDesktop) {
    <DialogDescription asChild={asChild}>{children}</DialogDescription>;
  }

  return <DrawerDescription asChild={asChild}>{children}</DrawerDescription>;
}

export function ModalFooter({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  const isDesktop = useMediaQuery("(min-width: 764px)");

  if (isDesktop) {
    return <DialogFooter className={className}>{children}</DialogFooter>;
  }

  return <DrawerFooter className={className}>{children}</DrawerFooter>;
}

export function ModalClose({ children }: PropsWithChildren) {
  const isDesktop = useMediaQuery("(min-width: 764px)");

  if (isDesktop) {
    return <DialogClose asChild>{children}</DialogClose>;
  }

  return <DrawerClose asChild>{children}</DrawerClose>;
}
