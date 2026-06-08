const testFiles = [
  '../src/lib/utils/api-response.test.js',
  '../src/lib/utils/api-error.test.js',
];

let failures = 0;

for (const testFile of testFiles) {
  const module = await import(new URL(testFile, import.meta.url).href);
  const tests = module.tests ?? [];

  for (const testCase of tests) {
    try {
      await testCase.run();
      console.log(`PASS ${testFile} :: ${testCase.name}`);
    } catch (error) {
      failures += 1;
      console.error(`FAIL ${testFile} :: ${testCase.name}`);
      console.error(error);
    }
  }
}

if (failures > 0) {
  process.exitCode = 1;
}
