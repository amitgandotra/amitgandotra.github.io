// Interview questions for the Design Patterns topic. Key = "topicId/pageId"; a = HTML.
window.INTERVIEW = window.INTERVIEW || {};
Object.assign(window.INTERVIEW, {
  "patterns/patterns-overview": [
    { q: `What are design patterns, and what are the three main categories?`, a: `<p>Named, reusable solutions to recurring design problems. Creational patterns handle object creation (Singleton, Factory, Builder); structural patterns handle composition (Adapter, Decorator, Facade, Proxy); behavioural patterns handle interaction and responsibility (Strategy, Observer, Command, State).</p>` },
    { q: `Which classic patterns are less necessary in Python, and why?`, a: `<p>Strategy and Command shrink to passing a callable, because functions are first-class. Singleton is usually a module-level object, since modules are cached. Iterator is built in via generators. Interfaces are replaced by duck typing or <code>typing.Protocol</code>. The problems remain; the ceremony does not.</p>` },
    { q: `How do you decide whether to apply a pattern?`, a: `<p>Start from a concrete pain: duplicated code, growing if/elif chains, tight coupling to a vendor, or hard-to-test code. Apply the simplest pattern that removes it, and avoid patterns "just in case", which adds indirection without benefit. Be ready to explain the trade-off.</p>` },
    { q: `What does "favour composition over inheritance" mean?`, a: `<p>Build behaviour by holding collaborator objects (has-a) rather than inheriting from a base class (is-a). Composition is more flexible (swap parts at runtime), avoids deep hierarchies and the fragile-base-class problem, and is the mechanism behind Strategy, Decorator, Adapter and Proxy.</p>` },
  ],

  "patterns/singleton": [
    { q: `How do you implement a Singleton in Python?`, a: `<p>Simplest: a module-level instance that everyone imports. Class-based options: override <code>__new__</code> to cache the instance, a class decorator, or a metaclass. Choose the class forms only if you need lazy creation or a class-based API.</p>` },
    { q: `How do you make a lazy Singleton thread-safe?`, a: `<p>Guard creation with a lock and use double-checked locking: check for the instance, acquire the lock, check again, then create. The first check keeps the fast path lock-free; the second stops two threads from both creating one.</p>` },
    { q: `Why is Singleton often considered an anti-pattern?`, a: `<p>It is global mutable state: it hides dependencies, couples code to a concrete class, makes unit tests interfere with each other, and complicates configuration. Prefer passing the shared object in (dependency injection) and letting the composition root create a single instance.</p>` },
    { q: `With multiprocessing, how many Singleton instances exist?`, a: `<p>One per process, since each process has its own memory. A true cross-process single instance needs an external coordination point such as a database, a lock file, or a service.</p>` },
  ],

  "patterns/factory": [
    { q: `Compare Simple Factory, Factory Method and Abstract Factory.`, a: `<ul><li><strong>Simple factory</strong>: one function/class that returns an object by type; not a GoF pattern.</li><li><strong>Factory Method</strong>: a base class defines a creation method that subclasses override.</li><li><strong>Abstract Factory</strong>: an interface for creating families of related objects (for example UI widgets for one platform).</li></ul>` },
    { q: `What problem does a factory solve?`, a: `<p>It centralises the decision of which concrete class to create, so callers depend on an abstraction and adding a new kind does not require editing callers (open/closed principle). It removes scattered if/elif chains that choose classes.</p>` },
    { q: `Show an idiomatic Python factory.`, a: `<pre><code>PARSERS = {"csv": CsvParser, "json": JsonParser}

def make_parser(kind):
    try:
        return PARSERS[kind]()
    except KeyError:
        raise ValueError(f"unknown parser: {kind}")</code></pre><p>Classes are objects, so a dict of name to class is the whole factory.</p>` },
    { q: `Python has one <code>__init__</code>. How do you provide alternative ways to construct an object?`, a: `<p>Use <code>@classmethod</code> constructors such as <code>Job.from_json(text)</code> or <code>Job.from_env()</code>. Because they receive <code>cls</code>, subclasses that inherit them return instances of themselves.</p>` },
  ],

  "patterns/strategy": [
    { q: `What is the difference between Strategy and State?`, a: `<p>Structurally similar, but different intent. Strategy: the client chooses an interchangeable algorithm, and strategies do not usually know each other. State: an object changes behaviour as its own state changes, and the states often trigger transitions to one another.</p>` },
    { q: `How would you implement Strategy idiomatically in Python?`, a: `<p>Pass a callable: <code>def checkout(price, discount): return discount(price)</code>. Use a plain function or lambda for simple cases, and a class with <code>__call__</code> when the strategy needs its own state or configuration. A dict from name to function supports config-driven selection.</p>` },
    { q: `What smell tells you to introduce Strategy?`, a: `<p>A growing if/elif chain choosing between algorithms, often keyed on a mode string, that must be edited every time a variant is added. Strategy moves each variant to its own unit and lets new ones be added without touching the caller.</p>` },
    { q: `Give real examples of Strategy in an integration context.`, a: `<p>Retry/backoff policies (fixed, exponential, jittered), pricing or discount rules per customer, pagination styles for different vendor APIs, and data-cleaning or matching rules that vary by customer.</p>` },
  ],

  "patterns/observer": [
    { q: `Explain the Observer pattern and push vs pull notification.`, a: `<p>A subject keeps a list of observers and notifies them when its state changes, so it does not need to know who they are. Push sends the data with the notification; pull sends a lightweight signal and observers query the subject for what they need.</p>` },
    { q: `What are common pitfalls of Observer?`, a: `<ul><li>Memory leaks: the subject's strong references keep observers alive (the lapsed-listener problem); provide unsubscribe or use weak references.</li><li>Modifying the listener list during notification.</li><li>One failing observer breaking the loop; decide how errors are isolated.</li><li>Hidden ordering assumptions and cascading updates.</li></ul>` },
    { q: `How is an in-process Observer different from a message broker?`, a: `<p>Observers are callbacks in one process: synchronous, no durability, no delivery guarantee across restarts. A broker (Kafka, RabbitMQ, SQS) decouples producers and consumers across processes and time, persists messages, and supports retries and replay, at the cost of complexity and eventual consistency.</p>` },
    { q: `How do you implement it in Python?`, a: `<p>Keep a list of callables; <code>subscribe(fn)</code> appends and returns an unsubscribe function; <code>emit(*args)</code> iterates over a copy of the list and calls each. No Observer interface is needed.</p>` },
  ],

  "patterns/builder": [
    { q: `What problem does Builder solve, and do you need it in Python?`, a: `<p>It avoids telescoping constructors and lets you assemble a complex object step by step, validating at the end. In Python, keyword arguments with defaults and a (frozen) dataclass cover most cases; use a real builder for multi-step, order-dependent, or validated construction such as building a request or query.</p>` },
    { q: `What is a fluent interface?`, a: `<p>Methods that return <code>self</code> so calls chain: <code>QueryBuilder("t").where(...).limit(10).build()</code>. It reads well but hides state changes, so keep the builder's scope small and make <code>build()</code> return an immutable result.</p>` },
    { q: `How do frozen dataclasses give you builder-like behaviour?`, a: `<p><code>dataclasses.replace(obj, timeout=60)</code> returns a modified copy of an immutable instance, so you can derive variants from a base configuration without mutating shared state.</p>` },
    { q: `Builder vs Factory?`, a: `<p>A factory decides <em>which</em> object to create and usually returns it in one call. A builder constructs <em>one complex</em> object in stages. They can be combined: a factory returns a pre-configured builder.</p>` },
  ],

  "patterns/adapter": [
    { q: `What is the difference between Adapter, Facade, Decorator and Proxy?`, a: `<ul><li><strong>Adapter</strong>: converts one interface into another that a client expects.</li><li><strong>Facade</strong>: offers a simpler interface to a complex subsystem.</li><li><strong>Decorator</strong>: same interface, adds behaviour.</li><li><strong>Proxy</strong>: same interface, controls access (lazy load, cache, permissions).</li></ul>` },
    { q: `Object adapter vs class adapter?`, a: `<p>An object adapter holds the adaptee (composition) and delegates; a class adapter inherits from the adaptee (often via multiple inheritance). Prefer object adapters: they are looser, work with subclasses of the adaptee, and expose only what you choose.</p>` },
    { q: `Give an integration example.`, a: `<p>Wrapping two payment providers behind a single <code>charge(amount_cents)</code> interface: one adapter converts to a vendor's <code>create_charge(cents, currency)</code>, another converts cents to dollars for a legacy bank API. The rest of the code depends only on <code>charge</code>.</p>` },
    { q: `Where do adapters belong in an architecture?`, a: `<p>At the system boundary (ports and adapters / hexagonal architecture), so vendor-specific formats, units and errors stay outside the core domain. They also make it easy to fake in tests.</p>` },
  ],

  "patterns/decorator-pattern": [
    { q: `How does the Decorator pattern differ from Python's <code>@decorator</code> syntax?`, a: `<p>The pattern wraps an object with another that has the same interface to add behaviour dynamically. The syntax wraps a function (or class) at definition time via <code>func = decorator(func)</code>. They are related uses of wrapping but are separate mechanisms.</p>` },
    { q: `Why use Decorator instead of subclassing?`, a: `<p>Inheritance is static and can lead to a combinatorial explosion (LoggingCachingClient, RetryingLoggingClient...). Decorators compose at runtime: <code>Caching(Logging(Client()))</code> lets you stack any combination in any order.</p>` },
    { q: `Does the order of decorators matter?`, a: `<p>Yes: the outermost layer sees the call first. Caching outside logging skips logging on a cache hit; logging outside caching logs every call. Retry outside a circuit breaker behaves very differently from the reverse.</p>` },
    { q: `Decorator vs Proxy?`, a: `<p>Structurally near-identical. Decorator's intent is to add responsibilities and it is often stacked; Proxy's intent is to control access to the same object (lazy initialisation, permissions, remote access).</p>` },
  ],

  "patterns/facade": [
    { q: `What is a Facade and how is it different from an Adapter?`, a: `<p>A Facade provides one simple entry point in front of a complex subsystem (for example <code>onboard(customer)</code> orchestrating identity, billing and email). An Adapter changes an interface to match one a client expects. Facade simplifies; Adapter translates.</p>` },
    { q: `What are the risks of a Facade?`, a: `<p>It can grow into a god-class that owns business logic instead of just coordinating, and it can hide failures. Keep it thin, surface which step failed, and leave the subsystem accessible for callers who need finer control.</p>` },
    { q: `How does a Facade help with multi-step operations that can fail midway?`, a: `<p>It is the natural place to own ordering and compensation: if step 3 fails, it undoes steps 1 and 2 (or records what needs cleanup), so callers of the simple method do not need to know the internals.</p>` },
    { q: `Where do you see Facades in real systems?`, a: `<p>An SDK's high-level client, a service layer over several repositories, and a backend-for-frontend or API gateway endpoint that aggregates several downstream calls into one.</p>` },
  ],

  "patterns/command": [
    { q: `What is the Command pattern used for?`, a: `<p>Turning an action into an object so it can be queued, scheduled, logged, retried, or undone. Typical uses: undo/redo, job queues, transactional scripts, and audit logs of user actions.</p>` },
    { q: `How would you implement undo?`, a: `<p>Give each command <code>execute()</code> and <code>undo()</code>, storing whatever state <code>undo</code> needs (for example the previous value) when it executes. Keep a history stack; undo pops and calls <code>undo()</code>, with a second stack for redo.</p>` },
    { q: `Command vs Strategy?`, a: `<p>Strategy picks <em>how</em> to do something (an algorithm). Command packages <em>a request to do something</em> with its arguments so it can be deferred or recorded. In Python both are often just callables, and <code>functools.partial</code> is a lightweight command.</p>` },
    { q: `What must you consider when commands are serialised into a queue?`, a: `<p>Store data (name plus arguments), not live objects, so commands survive restarts and can be replayed. Because delivery is often at-least-once, commands should be idempotent or carry an idempotency key.</p>` },
  ],

  "patterns/proxy": [
    { q: `Name the common types of proxy.`, a: `<ul><li><strong>Virtual</strong>: defer creating something expensive until needed.</li><li><strong>Protection</strong>: check permissions before delegating.</li><li><strong>Caching</strong>: return stored results for repeated calls.</li><li><strong>Remote</strong>: represent an object in another process or machine (RPC stubs).</li><li><strong>Rate-limiting/logging</strong>: control or observe calls.</li></ul>` },
    { q: `How do you implement lazy loading in Python?`, a: `<p>A wrapper that creates the real object on first use, or the built-in <code>functools.cached_property</code> for expensive attributes that should be computed once per instance. For thread safety, guard creation with a lock.</p>` },
    { q: `What are the risks of a caching proxy?`, a: `<p>Stale data, unbounded memory growth, and cache stampedes. Add expiry (TTL) or invalidation, bound the size, and consider request coalescing for hot keys.</p>` },
    { q: `Which Python features help build transparent proxies?`, a: `<p><code>__getattr__</code> delegates unknown attributes to the wrapped object, and <code>__call__</code>, <code>__getitem__</code> and other dunder methods can be forwarded explicitly (special methods are looked up on the type, so <code>__getattr__</code> does not cover them).</p>` },
  ],

  "patterns/state": [
    { q: `Explain the State pattern and when to use it.`, a: `<p>An object delegates behaviour to a state object that changes as the object's status changes, replacing large if/elif chains on a status field. Use it when the same action means different things in different states or when only some transitions are legal (orders, tickets, connections, jobs).</p>` },
    { q: `How would you model a small workflow in Python?`, a: `<p>An <code>Enum</code> for the states plus a dict of allowed transitions, with a single <code>move_to(new)</code> method that raises on an illegal transition. Use state classes only when each state carries substantial behaviour of its own.</p>` },
    { q: `How do you handle illegal or out-of-order transitions from external systems?`, a: `<p>Reject or quarantine them with a clear error and log them, rather than silently applying them. When syncing status with another system, treat the transition table as the source of truth, use timestamps or version numbers to detect stale updates, and reconcile periodically.</p>` },
    { q: `State vs Strategy?`, a: `<p>Strategy is chosen by the client and is normally stable for a call; State is driven internally and changes over the object's life, often deciding the next state itself.</p>` },
  ],

  "patterns/dependency-injection": [
    { q: `What is Dependency Injection, and how does it relate to IoC and the Dependency Inversion Principle?`, a: `<p>DI passes an object its collaborators instead of it creating them. Inversion of Control is the general idea that a framework or caller controls object wiring. The Dependency Inversion Principle says high-level code should depend on abstractions, not concrete implementations. DI is a technique that realises the principle.</p>` },
    { q: `How does DI improve testability?`, a: `<p>You can pass a fake or stub (an in-memory client, a controllable clock) instead of the real network, database or time, so tests are fast and deterministic without monkey-patching.</p>` },
    { q: `Do you need a DI container in Python?`, a: `<p>Usually not. Constructor or function arguments, wired in one composition root (often <code>main()</code>), are enough for most projects. Containers or frameworks help in very large applications with many layered dependencies.</p>` },
    { q: `What is wrong with <code>def f(client=Client()):</code>?`, a: `<p>The default is evaluated once at definition time and shared across calls (and constructing it may have side effects at import). Use <code>None</code> and create it inside, or accept a factory, or inject from the composition root.</p>` },
  ],
});
