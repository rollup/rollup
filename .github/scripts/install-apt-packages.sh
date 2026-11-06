#!/usr/bin/env bash
set -euo pipefail

apt_get_with_timeout() {
	local timeout_seconds=$1
	shift
	sudo timeout --kill-after=10 "$timeout_seconds" apt-get \
		-o Acquire::http::Timeout=10 \
		-o Acquire::https::Timeout=10 "$@"
}

download_packages() {
	apt_get_with_timeout 120 update &&
		apt_get_with_timeout 180 install --download-only -y "$@"
}

use_official_mirror() {
	echo "Removing azure.archive.ubuntu.com from /etc/apt/apt-mirrors.txt" >&2
	sudo sed -i '/azure\.archive\.ubuntu\.com/d' /etc/apt/apt-mirrors.txt
}

# apt only reports an error when no data arrives at all, so a mirror that keeps
# trickling data never fails over on its own (actions/runner-images#14823).
download_packages "$@" || {
	use_official_mirror
	download_packages "$@"
}
sudo apt-get install -y "$@"
