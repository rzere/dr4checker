import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeDomain, parseDomainList } from "./domain";

describe("normalizeDomain", () => {
  it("lowercases and strips protocol and path", () => {
    const r = normalizeDomain("HTTPS://WWW.Example.COM/path?q=1");
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.host, "www.example.com");
  });

  it("strips port and trailing dots", () => {
    const r = normalizeDomain("example.com:443.");
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.host, "example.com");
  });

  it("keeps subdomains as typed", () => {
    const r = normalizeDomain("blog.example.com");
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.host, "blog.example.com");
  });

  it("accepts punycode labels", () => {
    const r = normalizeDomain("xn--bcher-kva.example");
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.host, "xn--bcher-kva.example");
  });

  it("rejects empty input", () => {
    const r = normalizeDomain("   ");
    assert.equal(r.ok, false);
  });

  it("rejects bare TLD-less names", () => {
    const r = normalizeDomain("localhost");
    assert.equal(r.ok, false);
  });

  it("rejects IPv4", () => {
    const r = normalizeDomain("8.8.8.8");
    assert.equal(r.ok, false);
  });

  it("rejects invalid characters", () => {
    const r = normalizeDomain("exa_mple.com");
    assert.equal(r.ok, false);
  });
});

describe("parseDomainList", () => {
  it("parses up to five unique domains", () => {
    const r = parseDomainList("a.com, b.com; c.com\nd.com e.com a.com");
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.deepEqual(r.hosts, ["a.com", "b.com", "c.com", "d.com", "e.com"]);
    }
  });

  it("rejects more than five", () => {
    const r = parseDomainList("a.com b.com c.com d.com e.com f.com");
    assert.equal(r.ok, false);
  });
});
