#!/bin/bash

function extract_sizes() {
    dir_name=$1
    output_dir=$2
    output_dir=$(realpath $output_dir)
    currdir=${PWD}
    cd $(dirname $dir_name)
    base=$(basename $dir_name)
    find $base -type f -exec  wc -l '{}' \;  | awk -F' ' '{ print $2","$1}' | sed "s/^$base\///g" > $output_dir/sizes.log
    cd $currdir
}

function extract_logs() {
    dir_name=$1
    output_dir=$2

    git -C ${dir_name} log --all --numstat --date=short --pretty=format:'--%h--%ad--%aN' --no-renames > $output_dir/scv.log
}

function extract_changes() {
    log_file=$1
    output_dir=$2

    log_directory=$(dirname $log_file)
    file=$(basename $log_file)

    path_to_mount=$(realpath $log_directory)
    docker run -ti -v ${path_to_mount}:/data code-maat -l /data/${file} -a revisions -c git2 | tail -n +2 > ${output_dir}/changes.log
}

function extract_ages() {
    log_file=$1
    output_dir=$2

    log_directory=$(dirname $log_file)
    file=$(basename $log_file)

    path_to_mount=$(realpath $log_directory)
    docker run -ti -v ${path_to_mount}:/data code-maat -l /data/${file} -a age -c git2 | tail -n +2  > ${output_dir}/ages.log
}


input_repo_dir=$1
output_dir=$2

mkdir -p $output_dir

extract_sizes $input_repo_dir $output_dir
extract_logs $input_repo_dir $output_dir
extract_changes "$output_dir/scv.log" $output_dir
extract_ages "$output_dir/scv.log" $output_dir
python timecodeviz.py $output_dir > $output_dir/mine.json