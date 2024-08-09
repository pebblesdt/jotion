"use client";

import { ChevronLeftIcon, MenuIcon, PlusCircle, Search, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { ElementRef, useEffect, useRef, useState} from "react";

import { useMediaQuery } from "usehooks-ts";
// This is being used because media-queries in Tailwind are difficult
// specially regarding a sidebar that can be resizible through dragging
// We are going to define what is mobile and desktop through Javascript -> useMediaQuery

import { useMutation, useQuery } from "convex/react"; // useQuery was used for the un-beautiful list of documents
import { api } from "@/convex/_generated/api" ;

import { cn } from "@/lib/utils";
// definition is that it is a tiny (239B) utility for constructing className strings conditionally.

import UserItem from "./user-item";
import { Item } from "./item";
import { DocumentList } from "./document-list";
import { toast } from "sonner";

export const Navigation = () => {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px") // Same breakpoint for md in Tailwind
  const documents = useQuery(api.documents.get);
  const create = useMutation(api.documents.create)

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  useEffect( () => {
    if (isMobile) {
      collapse();
    } 
    else {
      resetWidth();
    }
  }, [isMobile])

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile])

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true; // This comes from a ref, this is the syntax.
    // Want this to persist between renders ("have I clicked the navbar?")
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;

    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`
      // Equivalent to below
      // sidebarRef.current.style.width = newWidth + "px";
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px)`);
    }
  }

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 240px)"
      );
      navbarRef.current.style.setProperty(
        "left",
        isMobile ? "100%" : "240px"
      );
      setTimeout(() => setIsResetting(false), 300);
    }
  }

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0px";
      navbarRef.current.style.setProperty(
        "width",
        "100%"
      );
      navbarRef.current.style.setProperty(
        "left",
        "0px"
      );
      setTimeout(() => setIsResetting(false), 300);
    }
  }

  const handleCreate = () => {
    const promise = create({ title: "Untitled" });
    // TODO: ver como refactorizar este toaster y después importarlo en otro lado
    // escribo este código varias veces y en verdad es una función handleToaster
    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created!",
      error: "Failed to create a new note"
    })
  }

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
        "group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[99999]",
        isResetting && "transition-all ease-in-out duration-300",
        isMobile && "w-0"
        )}
      >
        <div role="button"
          onClick = {collapse}
          className={cn("h-6 w-6 text-muted-foreground rounded-sm",
          "hover:bg-neutral-300 dark:hover:bg-neutral-600",
          "absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100",
          "transition",
          isMobile && "opacity-100",
          )}
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </div>
        <div>
           <UserItem />
           <Item 
            label="Search"
            icon={Search}
            isSearch
            onClick ={ () => {} }
           />
           <Item 
            label="Settings"
            icon={Settings}
            onClick ={ () => {} }
           />
           <Item onClick= {handleCreate} 
           label="New page"
           icon={PlusCircle}
           />
        </div>
        <div className="mt-4">
          <DocumentList />
        </div>
        {/* <div className="mt-4"> This was the un-beautiful list of documents
            {documents?.map((document) => (
              <p key={document._id}>{document.title}</p>
            ))}
        </div> */}
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={resetWidth} // A mí se me ocurrió hacerlo double click =)
          className="opacity-0 group-hover/sidebar:opacity-100
          transition cursor-ew-resize absolute h-full w-1
          bg-primary/10 right-0 top-0"
        />
      </aside>
      <div ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full"
        )}
        >
          <nav className="bg-transparent px-3 py-2 w-full" >
            {isCollapsed && (
              <MenuIcon 
                role="button"
                onClick={resetWidth}
                className="h-6 w-6 text-muted-foreground"
                id="leonel andres"
            />)}
          </nav>
      </div>
    </>
  )
}