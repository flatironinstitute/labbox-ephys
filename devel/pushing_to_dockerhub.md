# To push a new release to dockerhub

* Increment the version throughout the source code. For example, to increment from 0.4.5 to 0.4.6, search/replace these strings, taking care not to increment coincidental occurrences of 0.4.5.

* Apply a tag with the release.

```
git tag v0.4.6
```

* Push and push tag

```
git push --tags
```