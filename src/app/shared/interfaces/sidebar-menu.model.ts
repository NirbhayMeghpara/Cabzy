export class SidebarMenu {
  constructor(
    public link: string,
    public icon: string,
    public menu: string,
    public submenus?: SidebarMenu[],
    public showSubmenu?: boolean
  ) {}
}
