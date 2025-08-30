#!/usr/bin/env node

const path = require('path');
const { performance } = require('perf_hooks');

// Check if running in Bun or Node
const isBun = typeof Bun !== 'undefined';
const runtime = isBun ? 'Bun' : 'Node.js';

console.log(`\n🏃 Running benchmark on ${runtime} ${process.version || Bun?.version}\n`);

// Import appropriate yoga implementation
let Yoga, yogaWasm;

async function loadYoga() {
  if (isBun && typeof Bun.Yoga !== 'undefined') {
    Yoga = Bun.Yoga;
    console.log('✅ Using Bun.Yoga (native implementation)');
  } else {
    Yoga = null;
    console.log('❌ Bun.Yoga not available');
  }
  
  try {
    yogaWasm = require('yoga-layout-prebuilt');
    console.log('✅ Using yoga-layout-prebuilt');
  } catch (error) {
    console.log('❌ yoga-layout-prebuilt not available:', error.message);
  }
  
  console.log('');
}

// Complex layout scenarios
const layoutScenarios = [
  {
    name: "Simple Flexbox Layout",
    description: "Basic flex container with 10 children",
    nodeCount: 11,
    createLayout: (YogaAPI) => {
      const root = YogaAPI.Node.create();
      root.setFlexDirection(YogaAPI.FLEX_DIRECTION_ROW);
      root.setWidth(800);
      root.setHeight(600);
      
      for (let i = 0; i < 10; i++) {
        const child = YogaAPI.Node.create();
        child.setFlexGrow(1);
        child.setHeight(50);
        child.setMargin(YogaAPI.EDGE_ALL, 5);
        root.insertChild(child, i);
      }
      
      return root;
    }
  },
  {
    name: "Nested Flexbox Grid",
    description: "Grid layout with 100 items (10x10)",
    nodeCount: 111,
    createLayout: (YogaAPI) => {
      const root = YogaAPI.Node.create();
      root.setFlexDirection(YogaAPI.FLEX_DIRECTION_COLUMN);
      root.setWidth(1000);
      root.setHeight(1000);
      
      for (let row = 0; row < 10; row++) {
        const rowNode = YogaAPI.Node.create();
        rowNode.setFlexDirection(YogaAPI.FLEX_DIRECTION_ROW);
        rowNode.setFlexGrow(1);
        
        for (let col = 0; col < 10; col++) {
          const cellNode = YogaAPI.Node.create();
          cellNode.setFlexGrow(1);
          cellNode.setMargin(YogaAPI.EDGE_ALL, 2);
          cellNode.setPadding(YogaAPI.EDGE_ALL, 5);
          rowNode.insertChild(cellNode, col);
        }
        
        root.insertChild(rowNode, row);
      }
      
      return root;
    }
  },
  {
    name: "Deep Nested Layout",
    description: "Deeply nested structure (depth 20)",
    nodeCount: 21,
    createLayout: (YogaAPI) => {
      const root = YogaAPI.Node.create();
      root.setWidth(800);
      root.setHeight(600);
      
      let current = root;
      for (let i = 0; i < 20; i++) {
        const child = YogaAPI.Node.create();
        child.setFlexGrow(1);
        child.setPadding(YogaAPI.EDGE_ALL, i % 2 === 0 ? 10 : 5);
        child.setMargin(YogaAPI.EDGE_ALL, 2);
        current.insertChild(child, 0);
        current = child;
      }
      
      return root;
    }
  },
  {
    name: "Complex App Layout",
    description: "Realistic app layout with header, sidebar, content, footer",
    nodeCount: 50,
    createLayout: (YogaAPI) => {
      const root = YogaAPI.Node.create();
      root.setFlexDirection(YogaAPI.FLEX_DIRECTION_COLUMN);
      root.setWidth(1200);
      root.setHeight(800);
      
      // Header
      const header = YogaAPI.Node.create();
      header.setHeight(60);
      header.setFlexDirection(YogaAPI.FLEX_DIRECTION_ROW);
      header.setPadding(YogaAPI.EDGE_ALL, 10);
      
      // Header items
      for (let i = 0; i < 5; i++) {
        const item = YogaAPI.Node.create();
        item.setWidth(100);
        item.setMargin(YogaAPI.EDGE_RIGHT, 10);
        header.insertChild(item, i);
      }
      
      // Main container
      const main = YogaAPI.Node.create();
      main.setFlexGrow(1);
      main.setFlexDirection(YogaAPI.FLEX_DIRECTION_ROW);
      
      // Sidebar
      const sidebar = YogaAPI.Node.create();
      sidebar.setWidth(250);
      sidebar.setFlexDirection(YogaAPI.FLEX_DIRECTION_COLUMN);
      sidebar.setPadding(YogaAPI.EDGE_ALL, 15);
      
      // Sidebar items
      for (let i = 0; i < 10; i++) {
        const item = YogaAPI.Node.create();
        item.setHeight(40);
        item.setMargin(YogaAPI.EDGE_BOTTOM, 5);
        sidebar.insertChild(item, i);
      }
      
      // Content area
      const content = YogaAPI.Node.create();
      content.setFlexGrow(1);
      content.setFlexDirection(YogaAPI.FLEX_DIRECTION_COLUMN);
      content.setPadding(YogaAPI.EDGE_ALL, 20);
      
      // Content sections
      for (let i = 0; i < 15; i++) {
        const section = YogaAPI.Node.create();
        section.setHeight(80);
        section.setMargin(YogaAPI.EDGE_BOTTOM, 15);
        section.setFlexDirection(YogaAPI.FLEX_DIRECTION_ROW);
        
        // Section items
        for (let j = 0; j < 3; j++) {
          const sectionItem = YogaAPI.Node.create();
          sectionItem.setFlexGrow(1);
          sectionItem.setMargin(YogaAPI.EDGE_RIGHT, j < 2 ? 10 : 0);
          section.insertChild(sectionItem, j);
        }
        
        content.insertChild(section, i);
      }
      
      // Footer
      const footer = YogaAPI.Node.create();
      footer.setHeight(50);
      footer.setFlexDirection(YogaAPI.FLEX_DIRECTION_ROW);
      footer.setPadding(YogaAPI.EDGE_ALL, 15);
      
      // Footer items
      for (let i = 0; i < 3; i++) {
        const item = YogaAPI.Node.create();
        item.setFlexGrow(1);
        item.setMargin(YogaAPI.EDGE_RIGHT, i < 2 ? 20 : 0);
        footer.insertChild(item, i);
      }
      
      // Assemble layout
      main.insertChild(sidebar, 0);
      main.insertChild(content, 1);
      
      root.insertChild(header, 0);
      root.insertChild(main, 1);
      root.insertChild(footer, 2);
      
      return root;
    }
  }
];

function cleanupLayout(root, YogaAPI) {
  // For now, skip cleanup to avoid API differences
  // In a production benchmark, proper cleanup would be important
}

async function benchmarkScenario(scenario, YogaAPI, iterations = 100) {
  console.log(`📊 ${scenario.name}`);
  console.log(`   ${scenario.description} (${scenario.nodeCount} nodes)`);
  
  const times = [];
  let root;
  
  // Warmup
  for (let i = 0; i < 10; i++) {
    root = scenario.createLayout(YogaAPI);
    const start = performance.now();
    root.calculateLayout(800, 600, YogaAPI.DIRECTION_LTR);
    performance.now() - start;
    cleanupLayout(root, YogaAPI);
  }
  
  // Actual benchmark
  for (let i = 0; i < iterations; i++) {
    root = scenario.createLayout(YogaAPI);
    
    const start = performance.now();
    root.calculateLayout(800, 600, YogaAPI.DIRECTION_LTR);
    const end = performance.now();
    
    times.push(end - start);
    cleanupLayout(root, YogaAPI);
  }
  
  // Calculate statistics
  times.sort((a, b) => a - b);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const median = times[Math.floor(times.length / 2)];
  const p95 = times[Math.floor(times.length * 0.95)];
  const p99 = times[Math.floor(times.length * 0.99)];
  const min = times[0];
  const max = times[times.length - 1];
  
  console.log(`   Average: ${avg.toFixed(3)}ms`);
  console.log(`   Median:  ${median.toFixed(3)}ms`);
  console.log(`   Min:     ${min.toFixed(3)}ms`);
  console.log(`   Max:     ${max.toFixed(3)}ms`);
  console.log(`   P95:     ${p95.toFixed(3)}ms`);
  console.log(`   P99:     ${p99.toFixed(3)}ms`);
  console.log('');
  
  return { avg, median, min, max, p95, p99 };
}

async function runBenchmarks() {
  await loadYoga();
  
  const results = {};
  const iterations = 100;
  
  if (Yoga) {
    console.log('🚀 Benchmarking Bun.Yoga (Native Implementation)\n');
    results.bunYoga = {};
    
    for (const scenario of layoutScenarios) {
      results.bunYoga[scenario.name] = await benchmarkScenario(scenario, Yoga, iterations);
    }
  }
  
  if (yogaWasm) {
    console.log('🌐 Benchmarking yoga-wasm-web (WebAssembly Implementation)\n');
    results.yogaWasm = {};
    
    for (const scenario of layoutScenarios) {
      results.yogaWasm[scenario.name] = await benchmarkScenario(scenario, yogaWasm, iterations);
    }
  }
  
  // Print comparison summary
  if (results.bunYoga && results.yogaWasm) {
    console.log('📈 Performance Comparison Summary\n');
    console.log('Scenario'.padEnd(30) + 'Bun.Yoga'.padEnd(12) + 'WASM'.padEnd(12) + 'Speedup'.padEnd(10));
    console.log('-'.repeat(64));
    
    for (const scenario of layoutScenarios) {
      const bunTime = results.bunYoga[scenario.name].avg;
      const wasmTime = results.yogaWasm[scenario.name].avg;
      const speedup = (wasmTime / bunTime).toFixed(2) + 'x';
      
      console.log(
        scenario.name.padEnd(30) + 
        (bunTime.toFixed(3) + 'ms').padEnd(12) + 
        (wasmTime.toFixed(3) + 'ms').padEnd(12) + 
        speedup.padEnd(10)
      );
    }
    console.log('');
  }
  
  // System info
  console.log('💻 System Information');
  console.log(`Runtime: ${runtime} ${process.version || Bun?.version}`);
  console.log(`Platform: ${process.platform} ${process.arch}`);
  console.log(`CPU Cores: ${require('os').cpus().length}`);
  console.log(`Memory: ${Math.round(require('os').totalmem() / 1024 / 1024 / 1024)}GB`);
  
  return results;
}

// Run benchmark if called directly
if (require.main === module) {
  runBenchmarks().catch(console.error);
}

module.exports = { runBenchmarks, layoutScenarios };