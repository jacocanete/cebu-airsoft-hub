import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";

const navLinks = [
  { href: "/feed", label: "Forum" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/events", label: "Events" },
  { href: "/groups", label: "Groups" },
] as const;

export function Navbar() {
  const navigate = useNavigate();
  const { data: session } = useCurrentUser();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user ?? null;

  function handleLogout() {
    logout.mutate(undefined, { onSuccess: () => navigate({ to: "/" }) });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/logo.png"
            alt="Detachment Reaper"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <span className="hidden font-bold tracking-tight text-foreground sm:inline">
            Detachment Reaper
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-0.5 md:flex ml-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="label-military rounded px-3 py-1.5 transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "label-military rounded px-3 py-1.5 text-primary" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2 ml-auto">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded outline-none ring-ring focus:ring-2 cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                      {user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile/$username"
                    params={{ username: user.username }}
                    className="w-full"
                  >
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/marketplace/new" className="w-full">
                    Sell an Item
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/events/new" className="w-full">
                    Host a Game
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="w-full">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                to="/login"
                className="label-military rounded px-3 py-1.5 transition-colors hover:bg-accent hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <div className="ml-auto md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="flex h-9 w-9 items-center justify-center rounded hover:bg-accent transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 border-l border-border bg-background px-6 pt-10"
            >
              <div className="flex flex-col gap-6">
                <Link
                  to="/"
                  className="flex items-center gap-2.5 font-bold"
                  onClick={() => setMobileOpen(false)}
                >
                  <img
                    src="/logo.png"
                    alt="Detachment Reaper"
                    width={32}
                    height={32}
                    className="h-8 w-auto"
                  />
                  Detachment Reaper
                </Link>

                <nav className="flex flex-col gap-0.5">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="label-military rounded px-3 py-2.5 transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded border border-border px-3 py-2 text-center text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-accent"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="rounded bg-primary px-3 py-2 text-center text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
