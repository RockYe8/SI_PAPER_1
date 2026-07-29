# Answer Markdown Format

The parser accepts both the preferred simple format and a more Markdown-styled bold format.

## Preferred format

```md
Question 1
Result: Correct Option: B
Explanation:
English explanation:
...

中文解释：
...

Source: Study Manual Chapter ..., Section ...
```

## Also accepted

```md
**Question 1**
**Correct Option:** **B (I, II and III only)** [95]
**Explanation:** English explanation text.
**中文解釋:** 中文解释文字。
**Source:** Study Manual Chapter ..., Section ...
```

Keep the preferred format when possible. It is easier to review and less likely to confuse future tooling.
