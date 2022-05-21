import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Token} from "./_token"
import {Account} from "./account.model"
import {Height} from "./height.model"

@Entity_()
export class Transfer {
  constructor(props?: Partial<Transfer>) {
    Object.assign(this, props)
  }

  /**
   * A token transfer
   */
  @PrimaryColumn_()
  id!: string

  @Column_("varchar", {length: 4, nullable: false})
  token!: Token

  @Index_()
  @ManyToOne_(() => Account, {nullable: false})
  from!: Account

  @Index_()
  @ManyToOne_(() => Account, {nullable: false})
  to!: Account

  @Index_()
  @ManyToOne_(() => Height, {nullable: false})
  height!: Height

  @Column_("timestamp with time zone", {nullable: false})
  timestamp!: Date

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  amount!: bigint
}
