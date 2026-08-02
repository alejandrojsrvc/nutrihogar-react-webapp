import {
  Apple,
  ClipboardList,
  House,
  Package,
  ReceiptText,
  ShoppingBasket,
  Soup,
  UtensilsCrossed,
  UserRound,
  UsersRound,
} from 'lucide-react';
import type { ReactNode } from 'react';

export interface NavigationItem {
  label: string;
  to: string;
  icon: ReactNode;
  end?: boolean;
  primary?: boolean;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const mainNavigation: NavigationGroup[] = [
  {
    label: 'Tu día',
    items: [
      { end: true, icon: <House size={18} aria-hidden="true" />, label: 'Inicio', to: '/app' },
      { icon: <UtensilsCrossed size={18} aria-hidden="true" />, label: 'Registrar comida', primary: true, to: '/app/comidas/nueva' },
    ],
  },
  {
    label: 'Cocina',
    items: [
      { icon: <Apple size={18} aria-hidden="true" />, label: 'Alimentos', to: '/app/alimentos' },
      { icon: <Soup size={18} aria-hidden="true" />, label: 'Recetas', to: '/app/recetas' },
      { icon: <Package size={18} aria-hidden="true" />, label: 'Inventario', to: '/app/inventario' },
      { icon: <ClipboardList size={18} aria-hidden="true" />, label: 'Sobrantes', to: '/app/sobrantes' },
    ],
  },
  {
    label: 'Compras',
    items: [
      { icon: <ShoppingBasket size={18} aria-hidden="true" />, label: 'Lista de compras', to: '/app/lista-de-compras' },
      { icon: <ReceiptText size={18} aria-hidden="true" />, label: 'Historial de compras', to: '/app/compras' },
    ],
  },
  {
    label: 'Hogar',
    items: [
      { icon: <UserRound size={18} aria-hidden="true" />, label: 'Perfil', to: '/app/perfil' },
      { icon: <UsersRound size={18} aria-hidden="true" />, label: 'Invitaciones', to: '/app/invitaciones' },
    ],
  },
];
