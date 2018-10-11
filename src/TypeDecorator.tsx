import 'reflect-metadata';
import { ClassConstructorType } from './ClassConstructorType';

export function Type<T>(type: ClassConstructorType<T>) { return Reflect.metadata('design:type', type); }
