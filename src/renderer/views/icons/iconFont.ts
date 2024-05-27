class IconFont {
  static iconPool: string[] = [];
  static register(icon: string): string {
    this.iconPool.push(icon);
    return icon;
  }

  public static Plus = this.register("􀅼");
  public static Minus = this.register("􀅽");
  public static Exclamationmark = this.register("􀅎");
  public static ChevronUpDown = this.register("􀆏");
  public static Gearshape = this.register("􀣋");
  public static ServerRack = this.register("􀪬");
  public static SquareFill = this.register("􀂓");
  public static ArrowUp = this.register("􀄨");
  public static InfoCircle = this.register("􀅴");
  public static TextBadgeMinus = this.register("􀋹");
  public static DocOnDoc = this.register("􀉁");
  public static PlusMessage = this.register("􀡙");
  public static ChevronDown = this.register("􀆈");
  public static Checkmark = this.register("􀆅");
  public static Pin = this.register("􀎦");
  public static PinFill = this.register("􀎧");
  public static TrashCircleFill = this.register("􀈔");
  public static XMark = this.register("􀆄");
  public static XMarkCircleFill = this.register("􀁡");
  public static TrashFill = this.register("􀈒");
  public static Trash = this.register("􀈑");
  public static PhotoBadgePlus = this.register("􁃏");
  public static Square = this.register("􀂒");
  public static ListBullet = this.register("􀋲");
  public static Menu = this.register("􀱢");
  public static ArrowShapeLeftFill = this.register("􀰛");
  public static Export = this.register("􀈂");
}

export default IconFont;
