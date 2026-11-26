# GITHUB MANAGER — APK (Capacitor + GitHub Actions)

1. GitHub par new repo banao (jaise `github-manager-apk`).
2. Is folder ki saari files repo mein upload karo (`.github` folder samet).
3. Repo > **Actions** > **Build APK** > **Run workflow** (ya push par khud chalta hai).
4. 5-8 minute baad APK milega:
   - **Releases** (repo ke right side) > `GITHUB-MANAGER.apk`, ya
   - Actions run ke andar **Artifacts** > `GITHUB-MANAGER-APK`.
5. Phone mein APK install karo (Unknown sources allow karna hoga).

App ka code `www/` folder mein hai. Change karke push karo, naya APK ban jayega.
