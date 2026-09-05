#!/usr/bin/env bash
set -euo pipefail

# Update pacman and install packaging tools
pacman -Syu --noconfirm base-devel binutils zstd

# Create non-root builduser for makepkg
useradd -m builduser
echo "builduser ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

BUILD_DIR="/home/builduser/build"
mkdir -p "$BUILD_DIR"
cp /workspace/deb-package/*.deb "$BUILD_DIR/"
cd "$BUILD_DIR"

DEB_FILE=$(ls *.deb | head -n 1)
ar x "$DEB_FILE"
mkdir -p "$BUILD_DIR/src/pkg-data"
tar -xf data.tar.* -C "$BUILD_DIR/src/pkg-data"

TAG="${1:-1.1.0}"
VER="${TAG#v}"

cat << 'INNER_EOF' > PKGBUILD
pkgname=veylock-bin
pkgver=VERSION_PLACEHOLDER
pkgrel=1
pkgdesc="Production distribution packages for Veylock Password Manager"
arch=('x86_64')
url="https://github.com/RoyalRohan/veylock"
license=('custom')
depends=('webkit2gtk-4.1' 'gtk3' 'openssl' 'libayatana-appindicator')
provides=('veylock')
conflicts=('veylock')
options=('!strip')

package() {
  cp -a "${srcdir}/pkg-data/." "${pkgdir}/"
}
INNER_EOF

sed -i "s/VERSION_PLACEHOLDER/${VER}/g" PKGBUILD
chown -R builduser:builduser "$BUILD_DIR"

sudo -u builduser makepkg -f --nodeps

mkdir -p /workspace/arch-pkg
cp *.pkg.tar.zst /workspace/arch-pkg/
chmod -R 777 /workspace/arch-pkg
