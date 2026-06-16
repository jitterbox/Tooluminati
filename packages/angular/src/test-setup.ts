import 'zone.js';
import 'zone.js/testing';
import {
  getTestBed,
  TestBed,
  type TestModuleMetadata,
} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

export function configureAngularTestingModule(
  metadata: TestModuleMetadata,
): void {
  TestBed.configureTestingModule(metadata);
}
