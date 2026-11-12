# Security review

Read the diff and how requests, rows, and credentials move. Ignore the author's claim that it is safe.

Check account isolation, missing sessions, cookies, trusted origins, secrets in the client or image, SQL that destroys data, migration compatibility, and CI permissions. Untrusted pull requests must not receive deploy credentials. Actions should be pinned to a commit SHA.

Report only issues you can point at. Stop when the diff has no security-relevant behavior.
