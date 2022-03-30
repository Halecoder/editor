import OrderedMap from 'orderedmap';
import { GenericNode } from 'mystjs';
import {
  Blockquote,
  Break,
  FlowContent,
  List,
  ListContent,
  ListItem,
  Paragraph,
  PhrasingContent,
  ThematicBreak,
} from 'myst-spec';
import { NodeSpec } from 'prosemirror-model';
import { addListNodes } from 'prosemirror-schema-list';
import { MyNodeSpec, NodeGroups, Props } from './types';
import { nodeNames } from '../types';

export type Attrs = Record<string, never>;

export const doc: NodeSpec = {
  content: `(${NodeGroups.block} | ${NodeGroups.heading} | ${NodeGroups.top})+`,
};

export const docParagraph: NodeSpec = {
  content: 'paragraph',
};

export const docComment: NodeSpec = {
  content: `(${NodeGroups.block} | ${NodeGroups.heading} | ${nodeNames.equation})+`, // browsers will completely collapse the node when it's empty `+` is necessary
};

export const paragraph: MyNodeSpec<Attrs, Paragraph> = {
  attrs: {},
  content: `${NodeGroups.inline}*`,
  group: NodeGroups.block,
  parseDOM: [{ tag: 'p' }],
  toDOM() {
    return ['p', 0];
  },
  attrsFromMdastToken: () => ({}),
  toMyst: (props): Paragraph => ({
    type: 'paragraph',
    children: (props.children || []) as PhrasingContent[],
  }),
};

export const blockquote: MyNodeSpec<Attrs, Blockquote> = {
  attrs: {},
  content: `${NodeGroups.block}+`,
  group: NodeGroups.block,
  defining: true,
  parseDOM: [{ tag: 'blockquote' }],
  toDOM() {
    return ['blockquote', 0];
  },
  attrsFromMdastToken: () => ({}),
  toMyst: (props): Blockquote => ({
    type: 'blockquote',
    children: (props.children || []) as FlowContent[],
  }),
};

/** Horizontal rule */
export const horizontal_rule: MyNodeSpec<Attrs, ThematicBreak> = {
  attrs: {},
  group: NodeGroups.block,
  parseDOM: [{ tag: 'hr' }],
  toDOM() {
    return ['hr', { class: 'break' }];
  },
  attrsFromMdastToken: () => ({}),
  toMyst: (): ThematicBreak => ({ type: 'thematicBreak' }),
};

export const text: NodeSpec = {
  group: NodeGroups.inline,
};

export const hard_break: MyNodeSpec<Attrs, Break> = {
  attrs: {},
  inline: true,
  group: NodeGroups.inline,
  selectable: false,
  parseDOM: [{ tag: 'br' }],
  toDOM() {
    return ['br'];
  },
  attrsFromMdastToken: () => ({}),
  toMyst: (): Break => ({ type: 'break' }),
};

export type ListAttrs = {
  order: number | null;
};

const listNodes = addListNodes(
  OrderedMap.from({}),
  `paragraph ${NodeGroups.block}*`,
  NodeGroups.block,
) as OrderedMap<MyNodeSpec<any, any>>;

export type OrderedListAttrs = {
  order: number;
};

export const ordered_list = listNodes.get('ordered_list') as MyNodeSpec<OrderedListAttrs, List>;
ordered_list.attrsFromMdastToken = (token: GenericNode) => ({ order: token.start || 1 });
ordered_list.toMyst = (props: Props): List => ({
  type: 'list',
  ordered: true,
  start: props.start || undefined,
  children: (props.children || []) as ListContent[],
});

export const bullet_list = listNodes.get('bullet_list') as MyNodeSpec<Attrs, List>;
bullet_list.attrsFromMdastToken = () => ({});
bullet_list.toMyst = (props: Props): List => ({
  type: 'list',
  ordered: false,
  children: (props.children || []) as ListContent[],
});

export const list_item = listNodes.get('list_item') as MyNodeSpec<Attrs, ListItem>;
list_item.attrsFromMdastToken = () => ({});
list_item.toMyst = (props: Props): ListItem => {
  let { children } = props;
  if (children && children.length === 1 && children[0].type === 'paragraph') {
    children = children[0].children;
  }
  return {
    type: 'listItem',
    children: (children || []) as PhrasingContent[],
  };
};
