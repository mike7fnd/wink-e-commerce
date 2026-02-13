"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingCart, MessageSquare, Settings, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const sellerNavItems = [
  { href: "/account/my-shop", label: "Dashboard", icon: Home },
  { href: "/account/my-shop/products", label: "Products", icon: Package },
  { href: "/account/my-shop/orders", label: "Orders", icon: ShoppingCart },
  { href: "/account/my-shop/messages", label: "Messages", icon: MessageSquare },
  { href: "/account/my-shop/settings", label: "Settings", icon: Settings },
];

export function SellerNav() {
  const pathname = usePathname();

  const isSellerPath = pathname.startsWith("/account/my-shop");

  if (!isSellerPath) {
    return null;
  }

  return (
    <nav className={cn(
      "h-16 bg-background flex justify-around items-center shadow-[0_-2px_6px_rgba(0,0,0,0.06)]",
      "safe-area-bottom",
      "pb-2 md:hidden"
    )}>
      {sellerNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full text-xs font-medium gap-1 pt-1",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-7 w-7" strokeWidth={1.5} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
