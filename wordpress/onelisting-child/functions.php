<?php
/**
 * OneListing Child Theme functions and definitions
 *
 * @package OneListing_Child
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Enqueue parent and child theme styles properly.
 */
function onelisting_child_enqueue_styles() {
    // Parent theme stylesheet
    wp_enqueue_style(
        'onelisting-parent-style',
        get_template_directory_uri() . '/style.css',
        array(),
        wp_get_theme( 'onelisting' )->get( 'Version' )
    );

    // Child theme stylesheet
    wp_enqueue_style(
        'onelisting-child-style',
        get_stylesheet_directory_uri() . '/style.css',
        array( 'onelisting-parent-style' ),
        wp_get_theme()->get( 'Version' )
    );
}
add_action( 'wp_enqueue_scripts', 'onelisting_child_enqueue_styles', 20 );

/**
 * Add custom theme support or custom code below.
 */
function onelisting_child_theme_setup() {
    // Add support for custom logo, translation, etc. if needed
    load_child_theme_textdomain( 'onelisting-child', get_stylesheet_directory() . '/languages' );
}
add_action( 'after_setup_theme', 'onelisting_child_theme_setup' );

/**
 * Example Directorist custom hook/filter placement:
 * To override Directorist templates, create matching files under:
 * wp-content/themes/onelisting-child/directorist/
 */
