import * as Reconciler from 'react-reconciler';
import { ContinuousEventPriority, DefaultEventPriority, DiscreteEventPriority, IdleEventPriority } from 'react-reconciler/constants';
import { NoTimeout, TimeoutHandle } from '../models/renderer';
import { styleStringSymbol } from './diffing';

declare const process;

export const hideClass = 'react-unity__renderer__hidden';

export const eventPriorities = {
  discrete: DiscreteEventPriority,
  continuous: ContinuousEventPriority,
  default: DefaultEventPriority,
  idle: IdleEventPriority,
};

export const textTypes = {
  text: true,
  icon: true,
  style: true,
  script: true,
};

export function getAllowedProps(props, type) {
  const { children, tag, ...rest } = props;

  if (textTypes[type] && 'children' in props) {
    rest.children = (!children || typeof children === 'boolean') ? null : Array.isArray(children) ? children.join('') : children + '';
  }

  if (typeof props.style === 'string') rest[styleStringSymbol] = props.style;

  return rest;
}

declare const queueMicrotask: (callback: ((...args: any[]) => any)) => void;


type CommonConfig = Reconciler.HostConfig<unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, TimeoutHandle, NoTimeout>;

export const commonReconciler = {
  // -------------------
  //     Scheduling
  // -------------------

  now: Date.now,
  getCurrentEventPriority: () => UnityBridge.CurrentEventPriority || eventPriorities.default,

  noTimeout: -1 as const,
  scheduleTimeout: (callback, delay) => setTimeout(callback as any, delay),
  scheduleMicrotask: typeof queueMicrotask === 'function' ? queueMicrotask :
    callback => Promise.resolve(null).then(callback)
      .catch((error) => setTimeout(() => { throw error; }, 0)),
  cancelTimeout: (handle) => clearTimeout(handle),
};

export const isDevelopment = process.env.NODE_ENV === 'development';
