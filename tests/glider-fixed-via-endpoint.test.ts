import { expect, test } from "bun:test"
import { HighDensityForceImproveSolver } from "lib/HighDensityForceImproveSolver"
import fixture from "./fixtures/glider-fixed-via-endpoint.json"

test("keeps Glider ADDR6's fixed escape via attached to its topology ports", async (): Promise<void> => {
  // Exact node input from Glider's native TSX/core remaining-signal phase.
  // Its boundary via joins top and inner1 fragments in neighboring nodes.
  const solver = new HighDensityForceImproveSolver(structuredClone(fixture))
  solver.solve()
  expect(solver.solved).toBe(true)
  expect(solver.failed).toBe(false)

  const output = solver.visualize()
  const node = fixture.nodeWithPortPoints[0]
  output.rects = [{ center: node.center, width: node.width, height: node.height, stroke: "#94a3b8" }]
  output.points = [{
    x: node.portPoints[0].x,
    y: node.portPoints[0].y,
    color: "#b91c1c",
    label: "fixed top / inner1 ports",
  }]
  await expect(output).toMatchGraphicsSvg(import.meta.path)

  const route = solver.getOutput()[0]!
  expect(route.route[0].x).toBeCloseTo(fixture.hdRoutes[0].route[0]!.x, 6)
  expect(route.route[0].y).toBeCloseTo(fixture.hdRoutes[0].route[0]!.y, 6)
  expect(route.route.at(-1)!.x).toBeCloseTo(fixture.hdRoutes[0].route.at(-1)!.x, 6)
  expect(route.route.at(-1)!.y).toBeCloseTo(fixture.hdRoutes[0].route.at(-1)!.y, 6)
  expect(route.vias).toHaveLength(1)
  expect(route.route.some((point, index, points) =>
    index > 0 && point.z !== points[index - 1].z &&
    point.x === points[index - 1].x && point.y === points[index - 1].y &&
    Math.abs(point.x - route.vias[0].x) < 1e-6 &&
    Math.abs(point.y - route.vias[0].y) < 1e-6,
  )).toBe(true)
})
